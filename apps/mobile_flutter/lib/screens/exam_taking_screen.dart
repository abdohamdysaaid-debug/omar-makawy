import 'dart:async';
import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/exam_model.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';

class ExamTakingScreen extends StatefulWidget {
  final String examId;
  final bool isViewOnly;

  const ExamTakingScreen({
    super.key,
    required this.examId,
    this.isViewOnly = false,
  });

  @override
  State<ExamTakingScreen> createState() => _ExamTakingScreenState();
}

class _ExamTakingScreenState extends State<ExamTakingScreen> {
  final ApiService _apiService = ApiService();
  ExamModel? _exam;
  bool _isLoading = true;
  String? _errorMessage;

  int _currentQuestionIndex = 0;
  final Map<String, String> _selectedAnswers = {}; // question_id -> option_id
  Timer? _countdownTimer;
  int _secondsRemaining = 0;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchExamDetails();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchExamDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.get('/exams/${widget.examId}');
      if (response is Map<String, dynamic>) {
        final exam = ExamModel.fromJson(response);
        setState(() {
          _exam = exam;
          _isLoading = false;
          _secondsRemaining = exam.durationMinutes * 60;
        });

        if (!widget.isViewOnly && _secondsRemaining > 0) {
          _startTimer();
        }
      } else {
        throw Exception('فشل في تحميل بيانات الامتحان');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        _submitExam(autoSubmit: true);
      } else {
        setState(() {
          _secondsRemaining--;
        });
      }
    });
  }

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  Future<void> _submitExam({bool autoSubmit = false}) async {
    if (_isSubmitting) return;

    if (!autoSubmit) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('تسليم الامتحان'),
          content: Text(
            'أجبت على ${_selectedAnswers.length} من أصل ${_exam?.questions.length ?? 0} سؤال. هل ترغب في تأكيد التسليم؟',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('متابعة الحل'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('تأكيد التسليم', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
    }

    _countdownTimer?.cancel();
    setState(() => _isSubmitting = true);

    try {
      final answersPayload = _selectedAnswers.entries.map((e) {
        return {
          'question_id': e.key,
          'selected_option_id': e.value,
        };
      }).toList();

      final result = await _apiService.post(
        '/exams/${widget.examId}/submit',
        body: {'answers': answersPayload},
      );

      double? score;
      bool? isPassed;
      if (result is Map<String, dynamic>) {
        score = double.tryParse(result['score']?.toString() ?? '');
        isPassed = result['is_passed'] == true;
      }

      if (mounted) {
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('تم تسليم الامتحان بنجاح'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  (isPassed ?? true) ? Icons.check_circle : Icons.warning_amber_rounded,
                  color: (isPassed ?? true) ? AppColors.primary : Colors.orange,
                  size: 64,
                ),
                const SizedBox(height: 16),
                if (score != null)
                  Text(
                    'درجتك: $score / ${_exam?.totalScore ?? 100}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                const SizedBox(height: 8),
                Text((isPassed ?? true) ? 'أحسنت! لقد اجتزت الامتحان بنجاح.' : 'حاول مرة أخرى لتحسين مستواك.'),
              ],
            ),
            actions: [
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context, true);
                },
                child: const Text('العودة للامتحانات', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطأ أثناء التسليم: ${e.toString()}'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(
        title: _exam?.title ?? 'الامتحان',
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
                          onPressed: _fetchExamDetails,
                          child: const Text('إعادة المحاولة'),
                        ),
                      ],
                    ),
                  ),
                )
              : _buildExamBody(isDark),
    );
  }

  Widget _buildExamBody(bool isDark) {
    final exam = _exam!;
    if (exam.questions.isEmpty) {
      return const Center(child: Text('لا توجد أسئلة مضافة في هذا الاختبار'));
    }

    final currentQuestion = exam.questions[_currentQuestionIndex];
    final isLastQuestion = _currentQuestionIndex == exam.questions.length - 1;

    return Column(
      children: [
        // Top Timer & Question Progress Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: isDark ? AppColors.darkCard : AppColors.lightCard,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'السؤال ${_currentQuestionIndex + 1} من ${exam.questions.length}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              if (!widget.isViewOnly)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _secondsRemaining < 300
                        ? Colors.red.withOpacity(0.15)
                        : AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.timer,
                        size: 16,
                        color: _secondsRemaining < 300 ? Colors.red : AppColors.primary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatTime(_secondsRemaining),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _secondsRemaining < 300 ? Colors.red : AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),

        // Linear Progress
        LinearProgressIndicator(
          value: (_currentQuestionIndex + 1) / exam.questions.length,
          backgroundColor: Colors.grey.withOpacity(0.2),
          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),

        // Question Details & Options
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Question Text
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkCard : AppColors.lightCard,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        currentQuestion.text,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, height: 1.4),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'الدرجة: ${currentQuestion.score} درجة',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Options List
                const Text(
                  'اختر الإجابة الصحيحة:',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey),
                ),
                const SizedBox(height: 12),

                ...currentQuestion.options.map((opt) {
                  final isSelected = _selectedAnswers[currentQuestion.id] == opt.id ||
                      (widget.isViewOnly && currentQuestion.studentSelectedOptionId == opt.id);
                  final isCorrectAnswer = widget.isViewOnly && currentQuestion.correctOptionId == opt.id;

                  Color optionBorderColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
                  Color optionBgColor = isDark ? AppColors.darkCard : AppColors.lightCard;

                  if (isSelected) {
                    optionBorderColor = AppColors.primary;
                    optionBgColor = AppColors.primary.withOpacity(0.08);
                  }

                  if (widget.isViewOnly) {
                    if (isCorrectAnswer) {
                      optionBorderColor = Colors.green;
                      optionBgColor = Colors.green.withOpacity(0.12);
                    } else if (isSelected && !isCorrectAnswer) {
                      optionBorderColor = Colors.red;
                      optionBgColor = Colors.red.withOpacity(0.12);
                    }
                  }

                  return InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: widget.isViewOnly
                        ? null
                        : () {
                            setState(() {
                              _selectedAnswers[currentQuestion.id] = opt.id;
                            });
                          },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: optionBgColor,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: optionBorderColor, width: isSelected ? 2 : 1),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected ? AppColors.primary : Colors.grey,
                                width: 2,
                              ),
                              color: isSelected ? AppColors.primary : Colors.transparent,
                            ),
                            child: isSelected
                                ? const Icon(Icons.check, size: 16, color: Colors.white)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              opt.text,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),

        // Navigation & Submit Bottom Bar
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.lightCard,
            border: Border(
              top: BorderSide(
                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Previous button
              if (_currentQuestionIndex > 0)
                OutlinedButton.icon(
                  onPressed: () {
                    setState(() => _currentQuestionIndex--);
                  },
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text('السابق'),
                )
              else
                const SizedBox.shrink(),

              // Next / Submit Button
              if (!isLastQuestion)
                ElevatedButton.icon(
                  onPressed: () {
                    setState(() => _currentQuestionIndex++);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Text('التالي'),
                  label: const Icon(Icons.arrow_back),
                )
              else if (!widget.isViewOnly)
                ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : () => _submitExam(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  ),
                  icon: const Icon(Icons.check_circle_outline),
                  label: _isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('تسليم النهائي', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
