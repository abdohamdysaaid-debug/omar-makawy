import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/course_model.dart';
import '../models/package_model.dart';
import '../models/lecture_model.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'course_detail_screen.dart';
import 'package_detail_screen.dart';
import 'lecture_player_screen.dart';
import 'notifications_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _errorMessage;

  List<LectureModel> _continueLearningLectures = [];
  List<CourseModel> _recentCourses = [];
  List<PackageModel> _monthlyPackages = [];

  @override
  void initState() {
    super.initState();
    _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final yearId = auth.selectedAcademicYearId;

    try {
      final query = <String, String>{};
      if (yearId != null && yearId.isNotEmpty) {
        query['academic_year_id'] = yearId;
      }

      // Fetch continue learning
      try {
        final continueRes = await _apiService.get('/lectures/continue-learning');
        if (continueRes is List) {
          _continueLearningLectures = continueRes
              .map((item) => LectureModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}

      // Fetch courses
      try {
        final coursesRes = await _apiService.get('/courses', queryParams: query);
        if (coursesRes is List) {
          _recentCourses = coursesRes
              .map((item) => CourseModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}

      // Fetch packages
      try {
        final packagesRes = await _apiService.get('/packages', queryParams: query);
        if (packagesRes is List) {
          _monthlyPackages = packagesRes
              .map((item) => PackageModel.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}

      setState(() {
        _isLoading = false;
      });
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
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      appBar: AppHeader(
        title: 'منصة مستر عمر مكاوي',
        showBackButton: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadHomeData,
        color: AppColors.primary,
        child: _isLoading
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
                            onPressed: _loadHomeData,
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Greeting & Wallet Card
                        _buildWelcomeBanner(user, isDark),
                    const SizedBox(height: 24),

                    // Continue Learning Section (if any)
                    if (_continueLearningLectures.isNotEmpty) ...[
                      _buildSectionTitle('تابع المشاهدة', Icons.play_circle_outline),
                      const SizedBox(height: 12),
                      _buildContinueLearningList(isDark),
                      const SizedBox(height: 24),
                    ],

                    // Monthly Packages Carousel/List
                    _buildSectionTitle('الباقات الشهرية', Icons.calendar_month_outlined),
                    const SizedBox(height: 12),
                    _buildPackagesList(isDark),
                    const SizedBox(height: 24),

                    // Featured Courses List
                    _buildSectionTitle('أحدث الكورسات التعليمية', Icons.menu_book_outlined),
                    const SizedBox(height: 12),
                    _buildCoursesList(isDark),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildWelcomeBanner(dynamic user, bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primary.withOpacity(0.2),
                radius: 24,
                child: const Icon(Icons.person, color: AppColors.primary, size: 28),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'أهلاً بك، ${user?.name ?? "طالبنا المتميز"}',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.academicYearName ?? 'المرحلة التعليمية',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.primary.withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const Divider(color: Colors.white24, height: 28),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'رصيد المحفظة',
                    style: TextStyle(fontSize: 12, color: Colors.white60),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${user?.walletBalance ?? "0.0"} ج.م',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primary.withOpacity(0.4)),
                ),
                child: const Text(
                  'جاهز للدراسة',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 22),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildContinueLearningList(bool isDark) {
    return SizedBox(
      height: 150,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _continueLearningLectures.length,
        itemBuilder: (context, index) {
          final lec = _continueLearningLectures[index];
          return Container(
            width: 260,
            margin: const EdgeInsets.only(left: 12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              ),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => LecturePlayerScreen(lectureId: lec.id),
                  ),
                ).then((_) => _loadHomeData());
              },
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.play_circle_fill, color: AppColors.primary, size: 32),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            lec.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('نسبة الإنجاز', style: TextStyle(fontSize: 11, color: Colors.grey)),
                            Text('${lec.progressPercent.toStringAsFixed(0)}%',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: (lec.progressPercent / 100).clamp(0.0, 1.0),
                            backgroundColor: Colors.grey.withOpacity(0.2),
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                            minHeight: 6,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPackagesList(bool isDark) {
    if (_monthlyPackages.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: const Text('لا توجد باقات شهرية متاحة حالياً', style: TextStyle(color: Colors.grey)),
      );
    }

    return SizedBox(
      height: 190,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _monthlyPackages.length,
        itemBuilder: (context, index) {
          final pkg = _monthlyPackages[index];
          return Container(
            width: 220,
            margin: const EdgeInsets.only(left: 12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              ),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => PackageDetailScreen(packageId: pkg.id)),
                ).then((_) => _loadHomeData());
              },
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                    child: Container(
                      height: 100,
                      width: double.infinity,
                      color: Colors.purple.withOpacity(0.1),
                      child: pkg.thumbnailUrl != null && pkg.thumbnailUrl!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: pkg.thumbnailUrl!,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) =>
                                  const Icon(Icons.calendar_month, color: Colors.purple, size: 36),
                            )
                          : const Icon(Icons.calendar_month, color: Colors.purple, size: 36),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pkg.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${pkg.discountPrice ?? pkg.price} ج.م',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCoursesList(bool isDark) {
    if (_recentCourses.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: const Text('لا توجد كورسات متاحة حالياً', style: TextStyle(color: Colors.grey)),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _recentCourses.length,
      itemBuilder: (context, index) {
        final course = _recentCourses[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 0,
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
            ),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => CourseDetailScreen(courseId: course.id)),
              ).then((_) => _loadHomeData());
            },
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 70,
                      height: 70,
                      color: AppColors.primary.withOpacity(0.1),
                      child: course.thumbnailUrl != null && course.thumbnailUrl!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: course.thumbnailUrl!,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) =>
                                  const Icon(Icons.menu_book, color: AppColors.primary, size: 30),
                            )
                          : const Icon(Icons.menu_book, color: AppColors.primary, size: 30),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Text(
                              '${course.discountPrice ?? course.price} ج.م',
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              '${course.lecturesCount} محاضرة',
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
