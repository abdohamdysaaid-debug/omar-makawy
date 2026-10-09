class ExamOption {
  final String id;
  final String text;
  final String? imageUrl;

  ExamOption({
    required this.id,
    required this.text,
    this.imageUrl,
  });

  factory ExamOption.fromJson(Map<String, dynamic> json) {
    return ExamOption(
      id: json['id']?.toString() ?? '',
      text: json['text']?.toString() ?? json['option_text']?.toString() ?? '',
      imageUrl: json['image_url']?.toString(),
    );
  }
}

class ExamQuestion {
  final String id;
  final String text;
  final String? imageUrl;
  final double score;
  final List<ExamOption> options;
  final String? studentSelectedOptionId;
  final String? correctOptionId;
  final bool? isCorrect;
  final String? explanation;

  ExamQuestion({
    required this.id,
    required this.text,
    this.imageUrl,
    this.score = 1.0,
    this.options = const [],
    this.studentSelectedOptionId,
    this.correctOptionId,
    this.isCorrect,
    this.explanation,
  });

  factory ExamQuestion.fromJson(Map<String, dynamic> json) {
    var rawOptions = json['options'] as List? ?? [];
    var optList = rawOptions
        .map((o) => ExamOption.fromJson(o as Map<String, dynamic>))
        .toList();

    double parseDouble(dynamic val) {
      if (val == null) return 1.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 1.0;
    }

    return ExamQuestion(
      id: json['id']?.toString() ?? '',
      text: json['text']?.toString() ?? json['question_text']?.toString() ?? '',
      imageUrl: json['image_url']?.toString(),
      score: parseDouble(json['score'] ?? json['points']),
      options: optList,
      studentSelectedOptionId: json['student_selected_option_id']?.toString(),
      correctOptionId: json['correct_option_id']?.toString(),
      isCorrect: json['is_correct'] as bool?,
      explanation: json['explanation']?.toString(),
    );
  }
}

class ExamModel {
  final String id;
  final String title;
  final String? description;
  final int durationMinutes;
  final double totalScore;
  final double passingScore;
  final bool hasSubmitted;
  final double? myScore;
  final bool? isPassed;
  final int questionsCount;
  final List<ExamQuestion> questions;
  final String? lectureId;
  final String? courseId;
  final String? packageId;

  ExamModel({
    required this.id,
    required this.title,
    this.description,
    this.durationMinutes = 30,
    this.totalScore = 100.0,
    this.passingScore = 50.0,
    this.hasSubmitted = false,
    this.myScore,
    this.isPassed,
    this.questionsCount = 0,
    this.questions = const [],
    this.lectureId,
    this.courseId,
    this.packageId,
  });

  double? get score => myScore;

  factory ExamModel.fromJson(Map<String, dynamic> json) {
    var rawQuestions = json['questions'] as List? ?? [];
    var qList = rawQuestions
        .map((q) => ExamQuestion.fromJson(q as Map<String, dynamic>))
        .toList();

    double parseDouble(dynamic val, [double def = 0.0]) {
      if (val == null) return def;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? def;
    }

    int parseInt(dynamic val, [int def = 0]) {
      if (val == null) return def;
      if (val is int) return val;
      return int.tryParse(val.toString()) ?? def;
    }

    return ExamModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      durationMinutes: parseInt(json['duration_minutes'] ?? json['duration'], 30),
      totalScore: parseDouble(json['total_score'] ?? json['total_points'], 100.0),
      passingScore: parseDouble(json['passing_score'] ?? json['pass_percentage'], 50.0),
      hasSubmitted: json['has_submitted'] == true || json['my_submission'] != null,
      myScore: json['my_score'] != null ? parseDouble(json['my_score']) : null,
      isPassed: json['is_passed'] as bool?,
      questionsCount: parseInt(json['questions_count'] ?? qList.length),
      questions: qList,
      lectureId: json['lecture_id']?.toString(),
      courseId: json['course_id']?.toString(),
      packageId: json['package_id']?.toString(),
    );
  }
}
