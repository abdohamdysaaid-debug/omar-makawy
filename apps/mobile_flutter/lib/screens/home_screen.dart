import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/course_model.dart';
import '../models/package_model.dart';
import '../models/lecture_model.dart';
import '../models/academic_year.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import '../widgets/academic_year_selector.dart';
import 'course_detail_screen.dart';
import 'courses_screen.dart';
import 'packages_screen.dart';
import 'exams_screen.dart';
import 'subscriptions_screen.dart';
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

  List<AcademicYear> _academicYears = [];
  String? _selectedYearId;
  List<LectureModel> _continueLearningLectures = [];
  List<CourseModel> _recentCourses = [];
  List<PackageModel> _monthlyPackages = [];

  @override
  void initState() {
    super.initState();
    _loadAcademicYearsAndHomeData();
  }

  Future<void> _loadAcademicYearsAndHomeData() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _selectedYearId = auth.selectedAcademicYearId;

    try {
      final yearsRes = await _apiService.get('/academic-years');
      if (yearsRes is List) {
        _academicYears = yearsRes
            .map((item) => AcademicYear.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {}

    await _loadHomeData();
  }

  Future<void> _loadHomeData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final yearId = _selectedYearId ?? auth.selectedAcademicYearId;

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

      if (mounted) {
        setState(() {
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

  void _onSelectYear(String yearId) {
    setState(() {
      _selectedYearId = yearId;
    });
    final auth = Provider.of<AuthProvider>(context, listen: false);
    auth.setSelectedAcademicYear(yearId);
    _loadHomeData();
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
        onNotificationsTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NotificationsScreen()),
          );
        },
      ),
      body: RefreshIndicator(
        onRefresh: _loadHomeData,
        color: AppColors.primary,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 2.8,
                ),
              )
            : _errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(28.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              color: AppColors.error.withOpacity(0.12),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.error_outline_rounded,
                              size: 48,
                              color: AppColors.error,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Text(
                            _errorMessage!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: _loadHomeData,
                            icon: const Icon(Icons.refresh_rounded, size: 18),
                            label: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  )
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Luxury Hero Banner with Greeting
                        _buildHeroBanner(user, isDark),
                        const SizedBox(height: 20),

                        // Quick Navigation Action Shortcuts
                        _buildQuickShortcuts(isDark),
                        const SizedBox(height: 22),

                        // Academic Year Selector (if available)
                        if (_academicYears.isNotEmpty) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'تصفح حسب المرحلة الدراسية',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: isDark ? Colors.white70 : AppColors.textDark,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          AcademicYearSelector(
                            years: _academicYears,
                            selectedYearId: _selectedYearId ?? '',
                            onSelect: _onSelectYear,
                          ),
                          const SizedBox(height: 24),
                        ],

                        // Continue Learning Section
                        if (_continueLearningLectures.isNotEmpty) ...[
                          _buildSectionHeader('تابع المشاهدة', Icons.play_circle_filled_rounded, isDark),
                          const SizedBox(height: 12),
                          _buildContinueLearningList(isDark),
                          const SizedBox(height: 24),
                        ],

                        // Monthly Packages Carousel
                        _buildSectionHeader('الباقات الشهرية المتاحة', Icons.view_carousel_rounded, isDark),
                        const SizedBox(height: 12),
                        _buildPackagesList(isDark),
                        const SizedBox(height: 24),

                        // Featured Courses List
                        _buildSectionHeader('أحدث الكورسات التعليمية', Icons.menu_book_rounded, isDark),
                        const SizedBox(height: 12),
                        _buildCoursesList(isDark),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildHeroBanner(dynamic user, bool isDark) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: isDark ? AppColors.heroDarkGradient : AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primary.withOpacity(isDark ? 0.35 : 0.2),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(isDark ? 0.2 : 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            top: -20,
            left: -20,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.06),
              ),
            ),
          ),
          Positioned(
            bottom: -30,
            right: 40,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primaryLight.withOpacity(0.08),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withOpacity(0.18),
                        border: Border.all(color: Colors.white.withOpacity(0.4), width: 2),
                      ),
                      child: const Icon(
                        Icons.person_rounded,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  'أهلاً، ${user?.name ?? "طالبنا المتميز"}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: -0.3,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.verified_rounded, color: AppColors.accentGold, size: 18),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user?.academicYearName ?? 'منصة مستر عمر مكاوي للثانوية العامة',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.85),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.15)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.account_balance_wallet_rounded, color: AppColors.accentGold, size: 18),
                          const SizedBox(width: 8),
                          const Text(
                            'رصيد المحفظة:',
                            style: TextStyle(
                              fontSize: 12.5,
                              color: Colors.white70,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${(user?.walletBalance ?? 0.0).toStringAsFixed(0)} ج.م',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.bolt_rounded, size: 14, color: AppColors.accentGold),
                            SizedBox(width: 4),
                            Text(
                              'جاهز للتفوق',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickShortcuts(bool isDark) {
    final shortcuts = [
      {
        'title': 'اشتراكاتي',
        'icon': Icons.card_membership_rounded,
        'color': AppColors.primary,
        'onTap': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionsScreen())),
      },
      {
        'title': 'الكورسات',
        'icon': Icons.menu_book_rounded,
        'color': const Color(0xFF3B82F6),
        'onTap': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CoursesScreen())),
      },
      {
        'title': 'الباقات',
        'icon': Icons.view_carousel_rounded,
        'color': const Color(0xFF8B5CF6),
        'onTap': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PackagesScreen())),
      },
      {
        'title': 'الامتحانات',
        'icon': Icons.assignment_turned_in_rounded,
        'color': AppColors.accentGoldDark,
        'onTap': () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ExamsScreen())),
      },
    ];

    return Row(
      children: shortcuts.map((sc) {
        final Color col = sc['color'] as Color;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: InkWell(
              onTap: sc['onTap'] as VoidCallback,
              borderRadius: BorderRadius.circular(18),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
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
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: col.withOpacity(isDark ? 0.16 : 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(sc['icon'] as IconData, color: col, size: 22),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      sc['title'] as String,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: isDark ? Colors.white : AppColors.textDark,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, bool isDark) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primary, size: 18),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w900,
            color: isDark ? Colors.white : AppColors.textDark,
            letterSpacing: -0.3,
          ),
        ),
      ],
    );
  }

  Widget _buildContinueLearningList(bool isDark) {
    return SizedBox(
      height: 155,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _continueLearningLectures.length,
        itemBuilder: (context, index) {
          final lec = _continueLearningLectures[index];
          return Container(
            width: 270,
            margin: const EdgeInsets.only(left: 12),
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
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(18),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => LecturePlayerScreen(lectureId: lec.id),
                  ),
                ).then((_) => _loadHomeData());
              },
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.35),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                lec.title,
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13.5,
                                  color: isDark ? Colors.white : AppColors.textDark,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
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
                            Text(
                              'نسبة المشاهدة والإنجاز',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                              ),
                            ),
                            Text(
                              '${lec.progressPercent.toStringAsFixed(0)}%',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: (lec.progressPercent / 100).clamp(0.0, 1.0),
                            backgroundColor: isDark ? AppColors.darkSurfaceBorder : Colors.grey.shade200,
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
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        alignment: Alignment.center,
        child: Text(
          'لا توجد باقات شهرية متاحة حالياً',
          style: TextStyle(
            color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    }

    return SizedBox(
      height: 205,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _monthlyPackages.length,
        itemBuilder: (context, index) {
          final pkg = _monthlyPackages[index];
          return Container(
            width: 230,
            margin: const EdgeInsets.only(left: 14),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(20),
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
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(19)),
                    child: Container(
                      height: 110,
                      width: double.infinity,
                      color: const Color(0xFF8B5CF6).withOpacity(0.12),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          pkg.thumbnailUrl != null && pkg.thumbnailUrl!.isNotEmpty
                              ? CachedNetworkImage(
                                  imageUrl: pkg.thumbnailUrl!,
                                  fit: BoxFit.cover,
                                  errorWidget: (_, __, ___) => const Icon(
                                    Icons.view_carousel_rounded,
                                    color: Color(0xFF8B5CF6),
                                    size: 40,
                                  ),
                                )
                              : const Icon(
                                  Icons.view_carousel_rounded,
                                  color: Color(0xFF8B5CF6),
                                  size: 40,
                                ),
                          Positioned(
                            bottom: 8,
                            right: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.75),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${pkg.price} ج.م',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pkg.name,
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                            color: isDark ? Colors.white : AppColors.textDark,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.school_outlined, size: 13, color: AppColors.primary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                pkg.academicYearName ?? 'مرحلة دراسية',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
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
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
        ),
        alignment: Alignment.center,
        child: Text(
          'لا توجد كورسات متاحة حالياً',
          style: TextStyle(
            color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _recentCourses.length,
      itemBuilder: (context, index) {
        final course = _recentCourses[index];
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
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(18),
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
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      width: 76,
                      height: 76,
                      color: AppColors.primary.withOpacity(0.12),
                      child: course.thumbnailUrl != null && course.thumbnailUrl!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: course.thumbnailUrl!,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) =>
                                  const Icon(Icons.menu_book_rounded, color: AppColors.primary, size: 32),
                            )
                          : const Icon(Icons.menu_book_rounded, color: AppColors.primary, size: 32),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          course.name,
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14.5,
                            color: isDark ? Colors.white : AppColors.textDark,
                            letterSpacing: -0.2,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.video_library_rounded, size: 12, color: AppColors.primary),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${course.lecturesCount} محاضرة',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (course.price != null && course.price! > 0) ...[
                              const SizedBox(width: 8),
                              Text(
                                '${course.price} ج.م',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.accentGoldDark,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 14,
                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
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
