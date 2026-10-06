import 'lecture_model.dart';

class CourseModel {
  final String id;
  final String name;
  final String? description;
  final String? thumbnailUrl;
  final double price;
  final double? discountPrice;
  final bool isEnrolled;
  final String? academicYearId;
  final int lecturesCount;
  final List<LectureModel> lectures;

  CourseModel({
    required this.id,
    required this.name,
    this.description,
    this.thumbnailUrl,
    required this.price,
    this.discountPrice,
    this.isEnrolled = false,
    this.academicYearId,
    this.lecturesCount = 0,
    this.lectures = const [],
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
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

    return CourseModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      thumbnailUrl: json['thumbnail_url']?.toString() ?? json['thumbnail']?.toString() ?? json['image_url']?.toString(),
      price: parseDouble(json['price']),
      discountPrice: json['discount_price'] != null ? parseDouble(json['discount_price']) : null,
      isEnrolled: json['is_enrolled'] == true || json['is_subscribed'] == true,
      academicYearId: json['academic_year_id']?.toString(),
      lecturesCount: parseInt(json['lectures_count'] ?? json['lecturesCount'] ?? lectureList.length),
      lectures: lectureList,
    );
  }
}
