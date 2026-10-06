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
      // 1. Fetch exams list
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

      // 2. Fetch submissions / stats
      try {
        final progressRes = await _apiService.get('/students/my-progress');
        if (progressRes is Map<String, dynamic>) {
          _progressStats = progressRes;
        }
      } catch (_) {}

      final available = all.where((e) => !e.hasSubmitted).toList();
      final submitted = all.where((e) => e.hasSubmitted).toList();

      setState(() {
        _availableExams = available;
        _submittedExams = submitted;
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
            // Stats bar if available
            if (_progressStats != null) _buildStatsHeader(isDark),

            // Tab Bar
            Container(
              color: isDark ? AppColors.darkCard : AppColors.lightCard,
              child: TabBar(
                controller: _tabController,
                labelColor: AppColors.primary,
                unselectedLabelColor: isDark ? Colors.white54 : Colors.black54,
                indicatorColor: AppColors.primary,
                indicatorWeight: 3,
                tabs: [
                  Tab(text: 'الامتحانات المتاحة (${_availableExams.length})'),
                  Tab(text: 'نتائج الاختبارات (${_submittedExams.length})'),
                ],
              ),
            ),

            Expanded(
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
                            _buildExamList(_availableExams, isDark, isSubmittedTab: false),
                            _buildExamList(_submittedExams, isDark, isSubmittedTab: true),
                          ],
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsHeader(bool isDark) {
    final totalExams = _progressStats?['total_exams_taken'] ?? (_submittedExams.length);
    final avgScore = _progressStats?['average_score'] ?? 0;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('الامتحانات المنجزة', '$totalExams', Icons.task_alt, Colors.blue),
          Container(width: 1, height: 40, color: Colors.grey.withOpacity(0.3)),
          _buildStatItem('متوسط الدرجات', '$avgScore%', Icons.analytics_outlined, AppColors.primary),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ],
    );
  }

  Widget _buildExamList(List<ExamModel> list, bool isDark, {required bool isSubmittedTab}) {
    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSubmittedTab ? Icons.assignment_turned_in_outlined : Icons.assignment_outlined,
                size: 64,
                color: Colors.grey,
              ),
              const SizedBox(height: 16),
              Text(
                isSubmittedTab
                    ? 'لم تقم بتقديم أي امتحانات بعد'
                    : 'لا توجد امتحانات جديدة متاحة حالياً',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final exam = list[index];
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
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        exam.title,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (isSubmittedTab && exam.myScore != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: (exam.isPassed ?? (exam.myScore! >= exam.passingScore))
                              ? Colors.green.withOpacity(0.12)
                              : Colors.red.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${exam.myScore} / ${exam.totalScore}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: (exam.isPassed ?? (exam.myScore! >= exam.passingScore))
                                ? Colors.green
                                : Colors.red,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                if (exam.description != null && exam.description!.isNotEmpty)
                  Text(
                    exam.description!,
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.timer_outlined, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          '${exam.durationMinutes} دقيقة',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        const SizedBox(width: 14),
                        const Icon(Icons.help_outline, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          '${exam.questionsCount} أسئلة',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ExamTakingScreen(
                              examId: exam.id,
                              isViewOnly: isSubmittedTab,
                            ),
                          ),
                        ).then((_) => _fetchExamsData());
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isSubmittedTab ? Colors.grey.shade700 : AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(
                        isSubmittedTab ? 'عرض الإجابات' : 'بدء الاختبار',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
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
