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
        setState(() {
          _package = PackageModel.fromJson(response);
          _isLoading = false;
        });
      } else {
        throw Exception('بيانات الباقة غير صالحة');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
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
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                color: isDark ? AppColors.darkCard : Colors.grey.shade200,
                child: pkg.thumbnailUrl != null && pkg.thumbnailUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: pkg.thumbnailUrl!,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const Center(
                          child: Icon(Icons.calendar_month, size: 64, color: AppColors.primary),
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.calendar_month, size: 64, color: AppColors.primary),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.purple.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'الشهر ${pkg.monthNumber}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.purple,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (pkg.isEnrolled)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'مشترك بالفعل',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          Text(
            pkg.name,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),

          if (pkg.description != null && pkg.description!.isNotEmpty)
            Text(
              pkg.description!,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white70 : Colors.black87,
                height: 1.5,
              ),
            ),
          const SizedBox(height: 16),

          if (!pkg.isEnrolled)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                'هذا المحتوى متاح للحسابات التي لديها صلاحية وصول.',
                style: TextStyle(color: isDark ? Colors.white70 : Colors.black54),
              ),
            ),

          const SizedBox(height: 24),

          // Included Courses
          if (pkg.courses.isNotEmpty) ...[
            const Row(
              children: [
                Icon(Icons.menu_book, color: AppColors.primary, size: 20),
                SizedBox(width: 8),
                Text(
                  'الكورسات المشمولة في الباقة',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: pkg.courses.length,
              itemBuilder: (context, index) {
                final course = pkg.courses[index];
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
                    leading: const Icon(Icons.menu_book, color: AppColors.primary),
                    title: Text(course.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${course.lecturesCount} محاضرة'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
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
            const Row(
              children: [
                Icon(Icons.video_library, color: AppColors.primary, size: 20),
                SizedBox(width: 8),
                Text(
                  'محاضرات الباقة المباشرة',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: pkg.lectures.length,
              itemBuilder: (context, index) {
                final lec = pkg.lectures[index];
                final canAccess = pkg.isEnrolled || lec.isFree;
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
                    leading: Icon(
                      canAccess ? Icons.play_circle_fill : Icons.lock,
                      color: canAccess ? AppColors.primary : Colors.grey,
                    ),
                    title: Text(lec.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${lec.durationMinutes} دقيقة'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 14),
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
                          const SnackBar(content: Text('يرجى الاشتراك في الباقة لمشاهدة المحاضرة')),
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
