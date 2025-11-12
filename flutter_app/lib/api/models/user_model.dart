class UserModel {
  final int id;
  final String name;
  final String email;

  final DateTime? birthday;
  final String? phone;
  final String? address;

  /// API trả "1"/"2"/"0" (string). Lưu dạng String? và có getter label.
  final String? gender;

  final String? avatar; // "users/images/xxx.png" (path) hoặc URL
  final String? bankInfo;
  final String? desiredPosition;

  final int? workFieldId;
  final int? provinceId;
  final int? minSalary;
  final int? maxSalary;
  final int? workingFormId;
  final int? workExperienceId;
  final int? positionId;
  final int? educationId;

  final bool isVerify;
  final int? verifiedBy;
  final DateTime? verifiedAt;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  final bool isActive;
  final int? jobSearchStatus;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.birthday,
    this.phone,
    this.address,
    this.gender,
    this.avatar,
    this.bankInfo,
    this.desiredPosition,
    this.workFieldId,
    this.provinceId,
    this.minSalary,
    this.maxSalary,
    this.workingFormId,
    this.workExperienceId,
    this.positionId,
    this.educationId,
    this.isVerify = false,
    this.verifiedBy,
    this.verifiedAt,
    this.createdAt,
    this.updatedAt,
    this.isActive = true,
    this.jobSearchStatus,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Unwrap nếu response có lớp "data"
    final Map<String, dynamic> src = json.containsKey('data')
        ? Map<String, dynamic>.from(json['data'] as Map)
        : Map<String, dynamic>.from(json);

    return UserModel(
      id: _asInt(src['id']) ?? 0,
      name: (src['name'] ?? '').toString(),
      email: (src['email'] ?? '').toString(),

      birthday: _asDate(src['birthday']),
      phone: _asString(src['phone']),
      address: _asString(src['address']),

      gender: _asString(src['gender']), // "1","2","0"...

      avatar: _asString(src['avatar']),
      bankInfo: _asString(src['bank_info']),
      desiredPosition: _asString(src['desired_position']),

      workFieldId: _asInt(src['work_field_id']),
      provinceId: _asInt(src['province_id']),
      minSalary: _asInt(src['min_salary']),
      maxSalary: _asInt(src['max_salary']),
      workingFormId: _asInt(src['working_form_id']),
      workExperienceId: _asInt(src['work_experience_id']),
      positionId: _asInt(src['position_id']),
      educationId: _asInt(src['education_id']),

      isVerify: _asBool(src['is_verify']) ?? false,
      verifiedBy: _asInt(src['verified_by']),
      verifiedAt: _asDate(src['verified_at']),

      createdAt: _asDate(src['created_at']),
      updatedAt: _asDate(src['updated_at']),

      isActive: _asBool(src['is_active']) ?? true,
      jobSearchStatus: _asInt(src['job_search_status']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'birthday': birthday?.toIso8601String(),
      'phone': phone,
      'address': address,
      'gender': gender,
      'avatar': avatar,
      'bank_info': bankInfo,
      'desired_position': desiredPosition,
      'work_field_id': workFieldId,
      'province_id': provinceId,
      'min_salary': minSalary,
      'max_salary': maxSalary,
      'working_form_id': workingFormId,
      'work_experience_id': workExperienceId,
      'position_id': positionId,
      'education_id': educationId,
      'is_verify': isVerify,
      'verified_by': verifiedBy,
      'verified_at': verifiedAt?.toIso8601String(),
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'is_active': isActive,
      'job_search_status': jobSearchStatus,
    };
  }

  /// ===== Helpers tiện dùng =====

  /// "1" -> Nam, "2" -> Nữ, còn lại -> Khác/Không rõ
  String get genderLabel {
    switch ((gender ?? '').trim()) {
      case '1':
        return 'Nam';
      case '2':
        return 'Nữ';
      case '0':
        return 'Khác';
      default:
        return '—';
    }
  }

  /// Label trạng thái tìm việc (nếu bạn có mapping riêng thì sửa ở đây)
  String get jobStatusLabel {
    switch (jobSearchStatus) {
      case 0:
        return 'Không tìm việc';
      case 1:
        return 'Đang tìm việc';
      case 2:
        return 'Cân nhắc cơ hội';
      default:
        return '—';
    }
  }

  /// ===== Parsers an toàn =====
  static int? _asInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    if (v is num) return v.toInt();
    return int.tryParse('$v');
  }

  static bool? _asBool(dynamic v) {
    if (v == null) return null;
    if (v is bool) return v;
    final s = v.toString().toLowerCase().trim();
    if (s == '1' || s == 'true') return true;
    if (s == '0' || s == 'false') return false;
    return null;
  }

  static DateTime? _asDate(dynamic v) {
    if (v == null) return null;
    return DateTime.tryParse(v.toString());
  }

  static String? _asString(dynamic v) => v?.toString();
}
