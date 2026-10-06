class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final DateTime createdAt;
  final String? actionUrl;
  final Map<String, dynamic>? metadata;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    this.type = 'GENERAL',
    this.isRead = false,
    required this.createdAt,
    this.actionUrl,
    this.metadata,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic val) {
      if (val == null) return DateTime.now();
      try {
        return DateTime.parse(val.toString());
      } catch (_) {
        return DateTime.now();
      }
    }

    return NotificationModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? json['message']?.toString() ?? '',
      type: json['type']?.toString().toUpperCase() ?? 'GENERAL',
      isRead: json['is_read'] == true || json['read_at'] != null,
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      actionUrl: json['action_url']?.toString(),
      metadata: json['metadata'] is Map<String, dynamic> ? json['metadata'] : null,
    );
  }
}
