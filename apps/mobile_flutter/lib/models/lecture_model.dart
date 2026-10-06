class LectureAttachment {
  final String id;
  final String title;
  final String fileUrl;
  final String? fileType;
  final int? fileSize;

  LectureAttachment({
    required this.id,
    required this.title,
    required this.fileUrl,
    this.fileType,
    this.fileSize,
  });

  factory LectureAttachment.fromJson(Map<String, dynamic> json) {
    return LectureAttachment(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? json['name']?.toString() ?? 'ملف مرفق',
      fileUrl: json['file_url']?.toString() ?? json['url']?.toString() ?? '',
      fileType: json['file_type']?.toString() ?? json['mime_type']?.toString(),
      fileSize: json['file_size'] is int
          ? json['file_size']
          : int.tryParse(json['file_size']?.toString() ?? '0'),
    );
  }
}

class LectureModel {
  final String id;
  final String title;
  final String? description;
  final String? thumbnailUrl;
  final int durationMinutes;
  final int orderIndex;
  final bool isFree;
  final bool isLocked;
  final String? mainVideoUrl;
  final String? solutionVideoUrl;
  final double progressPercent;
  final int lastPositionSeconds;
  final bool isCompleted;
  final List<LectureAttachment> attachments;

  LectureModel({
    required this.id,
    required this.title,
    this.description,
    this.thumbnailUrl,
    this.durationMinutes = 0,
    this.orderIndex = 0,
    this.isFree = false,
    this.isLocked = false,
    this.mainVideoUrl,
    this.solutionVideoUrl,
    this.progressPercent = 0.0,
    this.lastPositionSeconds = 0,
    this.isCompleted = false,
    this.attachments = const [],
  });

  factory LectureModel.fromJson(Map<String, dynamic> json) {
    var rawAttachments = json['attachments'] as List? ?? [];
    var attachmentList = rawAttachments
        .map((a) => LectureAttachment.fromJson(a as Map<String, dynamic>))
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

    // Extract videos if populated in lecture payload
    String? mainUrl = json['main_video_url']?.toString();
    String? solutionUrl = json['solution_video_url']?.toString();

    if (json['videos'] is List) {
      for (var v in json['videos']) {
        if (v is Map<String, dynamic>) {
          final type = v['video_type']?.toString().toUpperCase();
          final url = v['video_url']?.toString() ?? v['url']?.toString();
          if (type == 'MAIN') mainUrl = url;
          if (type == 'SOLUTION') solutionUrl = url;
        }
      }
    }

    return LectureModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      thumbnailUrl: json['thumbnail_url']?.toString() ?? json['thumbnail']?.toString(),
      durationMinutes: parseInt(json['duration_minutes'] ?? json['duration']),
      orderIndex: parseInt(json['order_index'] ?? json['order']),
      isFree: json['is_free'] == true,
      isLocked: json['is_locked'] == true,
      mainVideoUrl: mainUrl,
      solutionVideoUrl: solutionUrl,
      progressPercent: parseDouble(json['progress_percent'] ?? json['progress']),
      lastPositionSeconds: parseInt(json['last_position_seconds'] ?? json['position']),
      isCompleted: json['is_completed'] == true ||
          (parseDouble(json['progress_percent'] ?? json['progress']) >= 90.0),
      attachments: attachmentList,
    );
  }
}
