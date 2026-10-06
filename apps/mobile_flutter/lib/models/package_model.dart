import 'course_model.dart';
import 'lecture_model.dart';

class PackageModel {
  final String id;
  final String name;
  final String? description;
  final String? thumbnailUrl;
  final double price;
  final double? discountPrice;
  final int monthNumber;
  final bool isEnrolled;
  final String? academicYearId;
  final List<CourseModel> courses;
  final List<LectureModel> lectures;
  final int lecturesCount;

  PackageModel({
    required this.id,
    required this.name,
    this.description,
    this.thumbnailUrl,
    required this.price,
    this.discountPrice,
    this.monthNumber = 1,
    this.isEnrolled = false,
    this.academicYearId,
    this.courses = const [],
    this.lectures = const [],
    this.lecturesCount = 0,
  });

  factory PackageModel.fromJson(Map<String, dynamic> json) {
    var rawCourses = json['courses'] as List? ?? [];
    var courseList = rawCourses
        .map((c) => CourseModel.fromJson(c as Map<String, dynamic>))
        .toList();

    var rawLectures = json['lectures'] as List? ?? [];
    var lectureList = rawLectures
        .map((l) => LectureModel.fromJson(l as Map<String, dynamic>))
        .toList();

    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    int parseInt(dynamic val) {
      if (val == null) return 0;
      if (val is int) return val;
      return int.tryParse(val.toString()) ?? 0;
    }

    return PackageModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      thumbnailUrl: json['thumbnail_url']?.toString() ?? json['thumbnail']?.toString() ?? json['image_url']?.toString(),
      price: parseDouble(json['price']),
      discountPrice: json['discount_price'] != null ? parseDouble(json['discount_price']) : null,
      monthNumber: parseInt(json['month_number'] ?? json['month'] ?? 1),
      isEnrolled: json['is_enrolled'] == true || json['is_subscribed'] == true,
      academicYearId: json['academic_year_id']?.toString(),
      courses: courseList,
      lectures: lectureList,
      lecturesCount: parseInt(json['lectures_count'] ?? lectureList.length),
    );
  }
}
