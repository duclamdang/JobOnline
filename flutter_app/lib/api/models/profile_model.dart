class ProfileModel {
  final int id;
  final String name;
  final String email;

  // basic
  final String? phone;
  final String? address;
  final String? birthday;
  final String? gender; // "0"/"1"/"2"
  final String? bankInfo;
  final int? jobSearchStatus;

  // thêm cho detail
  final String? avatar; // path hoặc url
  final String? desiredPosition;
  final String? workFieldTitle;
  final String? provinceName;
  final int? minSalary;
  final int? maxSalary;
  final String? workingFormTitle;
  final String? workExperienceTitle;
  final String? positionTitle;
  final String? educationTitle;
  final List<UserCV> cvs;
  final bool? isVerify;

  ProfileModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.address,
    this.birthday,
    this.gender,
    this.bankInfo,
    this.jobSearchStatus,
    this.avatar,
    this.desiredPosition,
    this.workFieldTitle,
    this.provinceName,
    this.minSalary,
    this.maxSalary,
    this.workingFormTitle,
    this.workExperienceTitle,
    this.positionTitle,
    this.educationTitle,
    this.cvs = const [],
    this.isVerify,
  });

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    final data = Map<String, dynamic>.from(json['data'] ?? json);
    return ProfileModel(
      id: _asInt(data['id']),
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      avatar: data['avatar'],
      phone: data['phone'],
      address: data['address'],
      birthday: data['birthday'],
      gender: '${data['gender'] ?? ''}',
      bankInfo: data['bank_info'],
      jobSearchStatus: data['job_search_status'] is num
          ? (data['job_search_status'] as num).toInt()
          : int.tryParse('${data['job_search_status'] ?? ''}'),
    );
  }

  Map<String, dynamic> toUpdatePayload() => {
    'name': name,
    'email': email,
    if (phone != null) 'phone': phone,
    if (address != null) 'address': address,
    if (birthday != null) 'birthday': birthday,
    if (gender != null) 'gender': gender,
    if (bankInfo != null) 'bank_info': bankInfo,
    if (jobSearchStatus != null) 'job_search_status': jobSearchStatus,
  };

  static int _asInt(dynamic v) {
    if (v is int) return v;
    if (v is num) return v.toInt();
    return int.tryParse('$v') ?? 0;
  }

  factory ProfileModel.fromDetailJson(Map<String, dynamic> json) {
    final data = Map<String, dynamic>.from(json['data'] ?? json);

    Map<String, dynamic> _m(v) => Map<String, dynamic>.from(v ?? const {});
    int? _i(v) => v is int ? v : (v is num ? v.toInt() : int.tryParse('$v'));
    bool? _b(v) {
      if (v == null) return null;
      if (v is bool) return v;
      final s = '$v'.toLowerCase();
      return s == 'true' || s == '1';
    }

    final cvs = <UserCV>[];
    final rawCvs = (data['cvs'] as List?) ?? const [];
    for (final e in rawCvs) {
      cvs.add(UserCV.fromJson(Map<String, dynamic>.from(e)));
    }

    return ProfileModel(
      id: _i(data['id']) ?? 0,
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      phone: data['phone'],
      address: data['address'],
      birthday: data['birthday'],
      gender: data['gender']?.toString(),
      bankInfo: data['bank_info'],
      jobSearchStatus: _i(data['job_search_status']),
      avatar: data['avatar'],
      desiredPosition: data['desired_position'],
      workFieldTitle: _m(data['work_field'])['title'],
      provinceName: _m(data['province'])['name'],
      minSalary: _i(data['min_salary']),
      maxSalary: _i(data['max_salary']),
      workingFormTitle: _m(data['working_form'])['title'],
      workExperienceTitle: _m(data['work_experience'])['title'],
      positionTitle: _m(data['position'])['title'],
      educationTitle: _m(data['education'])['title'],
      cvs: cvs,
      isVerify: _b(data['is_verify']),
    );
  }
}

class UserCV {
  final int id;
  final String fileName;
  final String filePath;
  final bool mainCV;

  UserCV({
    required this.id,
    required this.fileName,
    required this.filePath,
    required this.mainCV,
  });

  factory UserCV.fromJson(Map<String, dynamic> j) {
    bool _b(v) {
      if (v is bool) return v;
      final s = '$v'.toLowerCase();
      return s == 'true' || s == '1';
    }

    return UserCV(
      id: (j['id'] is int) ? j['id'] : int.tryParse('${j['id']}') ?? 0,
      fileName: j['file_name'] ?? '',
      filePath: j['file_path'] ?? '',
      mainCV: _b(j['main_cv']),
    );
  }
}
