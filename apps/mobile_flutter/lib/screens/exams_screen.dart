import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/exam_model.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'exam_taking_screen.dart';

class ExamsScreen extends StatefulWidget {
  const ExamsScreen({super.key});

  @override
  State<ExamsScreen> createState() => _ExamsScreenState();
}

class _ExamsScreenState extends State<ExamsScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;

  bool _isLoading = true;
  String? _errorMessage;
  List<ExamModel> _availableExams = [];
  List<ExamModel> _submittedExams = [];
  Map<String, dynamic>? _progressStats;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchExamsData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchExamsData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final yearId = auth.selectedAcademicYearId;

    try {
      final query = <String, String>{
        'show_in_student_menu': 'true',
      };
      if (yearId != null && yearId.isNotEmpty) {
        query['academic_year_id'] = yearId;
      }

      final response = await _apiService.get('/exams', queryParams: query);
      List<ExamModel> all = [];
      if (response is List) {
        all = response.map((item) => ExamModel.fromJson(item as Map<String, dynamic>)).toList();
      }

      try {
        final progressRes = await _apiService.get('/students/my-progress');
        if (progressRes is Map<String, dynamic>) {
          _progressStats = progressRes;
        }
      } catch (_) {}

      final available = all.where((e) => !e.hasSubmitted).toList();
      final submitted = all.where((e) => e.hasSubmitted).toList();

      if (mounted) {
        setState(() {
          _availableExams = available;
          _submittedExams = submitted;
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
      appBar: const AppHeader(
        title: 'الامتحانات والتقييمات',
        showBackButton: false,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchExamsData,
        color: AppColors.primary,
        child: Column(
          children: [
            // Custom Luxury Tab Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
              child: Container(
                height: 48,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : AppColors.lightCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.35),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  labelColor: Colors.white,
                  unselectedLabelColor: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                  labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                  unselectedLabelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  dividerColor: Colors.transparent,
                  tabs: [
                    Tab(text: 'الامتحانات المتاحة (${_availableExams.length})'),
                    Tab(text: 'تم تسليمها (${_submittedExams.length})'),
                  ],
                ),
              ),
            ),

            // Tab Views
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
                                  onPressed: _fetchExamsData,
                                  child: const Text('إعادة المحاولة'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : TabBarView(
                          controller: _tabController,
                          children: [
                            _buildExamList(_availableExams, isSubmitted: false, isDark: isDark),
                            _buildExamList(_submittedExams, isSubmitted: true, isDark: isDark),
                          ],
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExamList(List<ExamModel> list, {required bool isSubmitted, required bool isDark}) {
    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28.0),
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
                  isSubmitted ? Icons.task_alt_rounded : Icons.assignment_outlined,
                  size: 48,
                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                isSubmitted ? 'لم تقم بتسليم أي امتحانات بعد' : 'لا توجد امتحانات جديدة متاحة حالياً',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : AppColors.textDark,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final exam = list[index];
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
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: (isSubmitted ? AppColors.accentGold : AppColors.primary).withOpacity(isDark ? 0.16 : 0.12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        isSubmitted ? Icons.verified_rounded : Icons.assignment_rounded,
                        color: isSubmitted ? AppColors.accentGoldDark : AppColors.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            exam.title,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: isDark ? Colors.white : AppColors.textDark,
                              letterSpacing: -0.2,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              if (exam.durationMinutes != null && exam.durationMinutes! > 0) ...[
                                const Icon(Icons.timer_outlined, size: 13, color: AppColors.primary),
                                const SizedBox(width: 4),
                                Text(
                                  '${exam.durationMinutes} دقيقة',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                  ),
                                ),
                                const SizedBox(width: 12),
                              ],
                              if (exam.questionsCount != null) ...[
                                const Icon(Icons.help_outline_rounded, size: 13, color: AppColors.primary),
                                const SizedBox(width: 4),
                                Text(
                                  '${exam.questionsCount} سؤال',
                                  style: TextStyle(
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Divider(
                  height: 1,
                  color: isDark ? AppColors.darkBorder.withOpacity(0.6) : AppColors.lightBorder,
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (isSubmitted) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          exam.score != null ? 'الدرجة: ${exam.score} / ${exam.totalScore ?? 100}' : 'تم التسليم',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => ExamTakingScreen(examId: exam.id, isReview: true)),
                          );
                        },
                        icon: const Icon(Icons.visibility_rounded, size: 16),
                        label: const Text('مراجعة الإجابات'),
                      ),
                    ] else ...[
                      const Text(
                        'جاهز لبدء الاختبار',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                      ),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => ExamTakingScreen(examId: exam.id)),
                          ).then((_) => _fetchExamsData());
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        ),
                        icon: const Icon(Icons.play_arrow_rounded, size: 18),
                        label: const Text('بدء الامتحان'),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
