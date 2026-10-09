import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/course_model.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'course_detail_screen.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _errorMessage;
  List<CourseModel> _courses = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
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

      final response = await _apiService.get('/courses', queryParams: query);
      List<CourseModel> list = [];
      if (response is List) {
        list = response.map((item) => CourseModel.fromJson(item as Map<String, dynamic>)).toList();
      }

      if (mounted) {
        setState(() {
          _courses = list;
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

  List<CourseModel> get _filteredCourses {
    if (_searchQuery.trim().isEmpty) return _courses;
    return _courses
        .where((c) => c.name.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: const AppHeader(
        title: 'الكورسات التعليمية',
        showBackButton: false,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchCourses,
        color: AppColors.primary,
        child: Column(
          children: [
            // Search Input Header
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : AppColors.lightCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : AppColors.textDark,
                  ),
                  decoration: InputDecoration(
                    hintText: 'ابحث في محتوى الكورسات...',
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
                    filled: false,
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                ),
              ),
            ),

            // Courses List / Grid
            Expanded(
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
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                                const SizedBox(height: 14),
                                Text(_errorMessage!, textAlign: TextAlign.center),
                                const SizedBox(height: 18),
                                ElevatedButton(
                                  onPressed: _fetchCourses,
                                  child: const Text('إعادة المحاولة'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : _filteredCourses.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.menu_book_rounded,
                                      size: 48,
                                      color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    _searchQuery.isNotEmpty ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد كورسات متاحة حالياً',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                              itemCount: _filteredCourses.length,
                              itemBuilder: (context, index) {
                                final course = _filteredCourses[index];
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 14),
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
                                        blurRadius: 10,
                                        offset: const Offset(0, 3),
                                      ),
                                    ],
                                  ),
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(20),
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => CourseDetailScreen(courseId: course.id),
                                        ),
                                      ).then((_) => _fetchCourses());
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.all(14),
                                      child: Row(
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(16),
                                            child: Container(
                                              width: 84,
                                              height: 84,
                                              color: AppColors.primary.withOpacity(0.12),
                                              child: course.thumbnailUrl != null && course.thumbnailUrl!.isNotEmpty
                                                  ? CachedNetworkImage(
                                                      imageUrl: course.thumbnailUrl!,
                                                      fit: BoxFit.cover,
                                                      errorWidget: (_, __, ___) => const Icon(
                                                        Icons.menu_book_rounded,
                                                        color: AppColors.primary,
                                                        size: 36,
                                                      ),
                                                    )
                                                  : const Icon(
                                                      Icons.menu_book_rounded,
                                                      color: AppColors.primary,
                                                      size: 36,
                                                    ),
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
                                                    fontSize: 15,
                                                    color: isDark ? Colors.white : AppColors.textDark,
                                                    letterSpacing: -0.3,
                                                  ),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 8),
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
                                                          const Icon(Icons.play_lesson_rounded, size: 12, color: AppColors.primary),
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
                                                          fontSize: 13,
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
                            ),
            ),
          ],
        ),
      ),
    );
  }
}
