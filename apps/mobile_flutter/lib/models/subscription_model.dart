class SubscriptionModel {
  final String id;
  final String itemType; // 'COURSE', 'PACKAGE', 'LECTURE'
  final String itemId;
  final String itemName;
  final String? itemThumbnail;
  final double pricePaid;
  final String status; // 'ACTIVE', 'EXPIRED', 'REVOKED'
  final DateTime? createdAt;
  final DateTime? expiresAt;

  SubscriptionModel({
    required this.id,
    required this.itemType,
    required this.itemId,
    required this.itemName,
    this.itemThumbnail,
    this.pricePaid = 0.0,
    required this.status,
    this.createdAt,
    this.expiresAt,
  });

  String? get courseId => itemType == 'COURSE' ? itemId : null;
  String? get packageId => itemType == 'PACKAGE' ? itemId : null;
  String get targetName => itemName;
  String get targetType => itemType;

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      try {
        return DateTime.parse(val.toString());
      } catch (_) {
        return null;
      }
    }

    String type = json['item_type']?.toString().toUpperCase() ??
        json['type']?.toString().toUpperCase() ??
        'COURSE';

    String name = json['item_name']?.toString() ??
        json['title']?.toString() ??
        json['course']?['name']?.toString() ??
        json['package']?['name']?.toString() ??
        'اشتراك تعليمي';

    String? thumbnail = json['item_thumbnail']?.toString() ??
        json['thumbnail_url']?.toString() ??
        json['course']?['thumbnail_url']?.toString() ??
        json['package']?['thumbnail_url']?.toString();

    String id = json['id']?.toString() ?? '';
    String itemId = json['item_id']?.toString() ??
        json['course_id']?.toString() ??
        json['package_id']?.toString() ??
        '';

    return SubscriptionModel(
      id: id,
      itemType: type,
      itemId: itemId,
      itemName: name,
      itemThumbnail: thumbnail,
      pricePaid: parseDouble(json['price_paid'] ?? json['amount']),
      status: json['status']?.toString().toUpperCase() ?? 'ACTIVE',
      createdAt: parseDate(json['created_at']),
      expiresAt: parseDate(json['expires_at']),
    );
  }
}
