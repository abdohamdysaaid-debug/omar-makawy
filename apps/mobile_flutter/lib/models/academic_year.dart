class AcademicYear {
  final String id;
  final String name;
  final String? stage;
  final bool isActive;
  final bool isDefault;
  final int orderIndex;

  AcademicYear({
    required this.id,
    required this.name,
    this.stage,
    this.isActive = true,
    this.isDefault = false,
    this.orderIndex = 0,
  });

  factory AcademicYear.fromJson(Map<String, dynamic> json) {
    return AcademicYear(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      stage: json['stage']?.toString(),
      isActive: json['is_active'] == true || json['status'] == 'ACTIVE',
      isDefault: json['is_default'] == true,
      orderIndex: json['order_index'] is int
          ? json['order_index']
          : int.tryParse(json['order_index']?.toString() ?? '0') ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'stage': stage,
      'is_active': isActive,
      'is_default': isDefault,
      'order_index': orderIndex,
    };
  }
}
