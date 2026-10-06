class UserModel {
  final String id;
  final String name;
  final String mobileNumber;
  final String? parentMobileNumber;
  final String? governorate;
  final String role;
  final String? academicYearId;
  final String? academicYearName;
  final double walletBalance;
  final bool isBlocked;
  final String? avatarUrl;

  UserModel({
    required this.id,
    required this.name,
    required this.mobileNumber,
    this.parentMobileNumber,
    this.governorate,
    required this.role,
    this.academicYearId,
    this.academicYearName,
    this.walletBalance = 0.0,
    this.isBlocked = false,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final studentProfile = json['student_profile'] is Map<String, dynamic>
        ? json['student_profile'] as Map<String, dynamic>
        : null;

    // Handle nested academic_year object, string id, or student_profile
    String? yearId;
    String? yearName;

    if (json['academic_year'] is Map<String, dynamic>) {
      yearId = json['academic_year']['id']?.toString();
      yearName = json['academic_year']['name_ar']?.toString() ??
          json['academic_year']['name']?.toString();
    } else if (json['academic_year_id'] != null) {
      yearId = json['academic_year_id']?.toString();
      yearName = json['academic_year_name_ar']?.toString() ??
          json['academic_year_name']?.toString() ??
          json['academic_year_name_en']?.toString();
    } else if (studentProfile != null) {
      yearId = studentProfile['academic_year_id']?.toString();
      yearName = studentProfile['academic_year_name_ar']?.toString() ??
          studentProfile['academic_year_name']?.toString() ??
          studentProfile['academic_year_name_en']?.toString();
    }

    double parseWallet(dynamic val) {
      if (val == null) return 0.0;
      if (val is num) return val.toDouble();
      return double.tryParse(val.toString()) ?? 0.0;
    }

    final rawWallet = json['wallet_balance'] ??
        studentProfile?['wallet_balance'] ??
        json['wallet']?['balance'] ??
        json['wallet_balance_egp'];

    return UserModel(
      id: json['id']?.toString() ?? json['sub']?.toString() ?? '',
      name: json['full_name']?.toString() ?? json['name']?.toString() ?? '',
      mobileNumber: json['phone']?.toString() ?? json['mobile_number']?.toString() ?? '',
      parentMobileNumber: json['parent_phone']?.toString() ??
          json['guardian_phone']?.toString() ??
          json['parent_mobile_number']?.toString() ??
          studentProfile?['parent_phone']?.toString() ??
          studentProfile?['guardian_phone']?.toString(),
      governorate: json['governorate_name_ar']?.toString() ??
          json['governorate']?.toString() ??
          studentProfile?['governorate_name_ar']?.toString(),
      role: json['role']?.toString() ?? 'STUDENT',
      academicYearId: yearId,
      academicYearName: yearName,
      walletBalance: parseWallet(rawWallet),
      isBlocked: json['is_blocked'] == true || json['status'] == 'BLOCKED',
      avatarUrl: json['avatar_url']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'mobile_number': mobileNumber,
      'parent_mobile_number': parentMobileNumber,
      'governorate': governorate,
      'role': role,
      'academic_year_id': academicYearId,
      'academic_year_name': academicYearName,
      'wallet_balance': walletBalance,
      'is_blocked': isBlocked,
      'avatar_url': avatarUrl,
    };
  }
}
