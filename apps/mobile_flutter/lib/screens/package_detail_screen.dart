import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/package_model.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'course_detail_screen.dart';
import 'lecture_player_screen.dart';

class PackageDetailScreen extends StatefulWidget {
  final String packageId;

  const PackageDetailScreen({super.key, required this.packageId});

  @override
  State<PackageDetailScreen> createState() => _PackageDetailScreenState();
}

class _PackageDetailScreenState extends State<PackageDetailScreen> {
  final ApiService _apiService = ApiService();
  PackageModel? _package;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchPackageDetails();
  }

  Future<void> _fetchPackageDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.get('/packages/${widget.packageId}');
      if (response is Map<String, dynamic>) {
        if (mounted) {
          setState(() {
            _package = PackageModel.fromJson(response);
            _isLoading = false;
          });
        }
      } else {
        throw Exception('بيانات الباقة غير صالحة');
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
        title: _package?.name ?? 'تفاصيل الباقة',
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
                          onPressed: _fetchPackageDetails,
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
    final pkg = _package!;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Luxury Thumbnail Card
          ClipRRect(
            borderRadius: BorderRadius.circular(22),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                color: const Color(0xFF8B5CF6).withOpacity(0.12),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    pkg.thumbnailUrl != null && pkg.thumbnailUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: pkg.thumbnailUrl!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => const Center(
                              child: Icon(Icons.view_carousel_rounded, size: 60, color: Color(0xFF8B5CF6)),
                            ),
                          )
                        : const Center(
                            child: Icon(Icons.view_carousel_rounded, size: 60, color: Color(0xFF8B5CF6)),
                          ),
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
                          '${pkg.price} ج.م',
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

          // Month Badge & Enrollment
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withOpacity(isDark ? 0.2 : 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.3)),
                ),
                child: Text(
                  'الشهر ${pkg.monthNumber}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF8B5CF6),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (pkg.isEnrolled)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(isDark ? 0.2 : 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle_rounded, size: 14, color: AppColors.primary),
                      SizedBox(width: 4),
                      Text(
                        'مشترك في الباقة',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),

          Text(
            pkg.name,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : AppColors.textDark,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 8),

          if (pkg.description != null && pkg.description!.isNotEmpty)
            Text(
              pkg.description!,
              style: TextStyle(
                fontSize: 13.5,
                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                height: 1.5,
              ),
            ),
          const SizedBox(height: 22),

          // Included Courses
          if (pkg.courses.isNotEmpty) ...[
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.menu_book_rounded, color: AppColors.primary, size: 18),
                ),
                const SizedBox(width: 10),
                Text(
                  'الكورسات المشمولة في الباقة',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : AppColors.textDark,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: pkg.courses.length,
              itemBuilder: (context, index) {
                final course = pkg.courses[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkCard : AppColors.lightCard,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
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
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.menu_book_rounded, color: AppColors.primary, size: 22),
                    ),
                    title: Text(
                      course.name,
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 14.5,
                        color: isDark ? Colors.white : AppColors.textDark,
                      ),
                    ),
                    subtitle: Text(
                      '${course.lecturesCount} محاضرة',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                      ),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CourseDetailScreen(courseId: course.id),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
          ],

          // Direct Lectures in Package
          if (pkg.lectures.isNotEmpty) ...[
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
                  'محاضرات الباقة المباشرة',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : AppColors.textDark,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: pkg.lectures.length,
              itemBuilder: (context, index) {
                final lec = pkg.lectures[index];
                final canAccess = pkg.isEnrolled || lec.isFree;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkCard : AppColors.lightCard,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      width: 1.2,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: canAccess ? AppColors.primary.withOpacity(isDark ? 0.16 : 0.1) : (isDark ? AppColors.darkSurfaceLight : Colors.grey.shade100),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        canAccess ? Icons.play_circle_fill_rounded : Icons.lock_rounded,
                        color: canAccess ? AppColors.primary : (isDark ? Colors.white30 : Colors.black26),
                        size: 22,
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
                    subtitle: Text(
                      '${lec.durationMinutes} دقيقة',
                      style: TextStyle(fontSize: 12, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
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
                            content: const Text('يرجى الاشتراك في الباقة لمشاهدة المحاضرة'),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      }
                    },
                  ),
                );
              },
            ),
          ],
        ],
      ),
    );
  }
}
