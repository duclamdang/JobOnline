class JobModel {
  final int id;
  final String title;
  final String companyName;
  final int companyId;
  final String? companyLogo;
  final String salaryRange;
  final String? companyAddress;
  final String? companySize;
  final String location;
  final int? deadline;
  final String? description;
  final int? quantity;
  final String? workingForm;
  final List<String> workFields;
  final String? workExperience;
  final String? education;
  final String? position;
  final String? requirement;
  final String? endDate;
  final String? isFullTime;
  final String slug;
  final String? skills;
  final String? gender;
  final String? isActive;
  final String? isUrgent;
  final String? benefit;
  final bool? salaryNegotiable;
  final String? address;
  final String? district;
  final List<SimilarJob> similar;

  JobModel({
    required this.id,
    required this.title,
    required this.companyName,
    required this.companyId,
    this.companyLogo,
    required this.salaryRange,
    this.companyAddress,
    this.companySize,
    required this.location,
    this.deadline,
    this.description,
    this.quantity,
    this.workingForm,
    required this.workFields,
    this.workExperience,
    this.education,
    this.position,
    this.requirement,
    this.endDate,
    this.isFullTime,
    required this.slug,
    this.skills,
    this.gender,
    this.isActive,
    this.isUrgent,
    this.benefit,
    this.salaryNegotiable,
    this.address,
    this.district,
    this.similar = const [],
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> src = json.containsKey('data')
        ? Map<String, dynamic>.from(json['data'] as Map)
        : Map<String, dynamic>.from(json);
    return JobModel(
      id: json["id"] is int ? json["id"] : int.tryParse("${json["id"]}") ?? 0,
      title: json["title"] ?? "",
      companyName: json["company_name"] ?? "",
      companyId: json["company_id"] is int
          ? json["company_id"]
          : int.tryParse("${json["company_id"]}") ?? 0,
      companyLogo: json["company_logo"],
      salaryRange: json["salary_range"] ?? "",
      companyAddress: json["company_address"],
      companySize: json["company_size"],
      location: json["location"] ?? "",
      deadline: _parseInt(json["deadline"]) ?? _parseInt(json["deadline "]),
      description: json["description"],
      quantity: _parseInt(json["quantity"]),
      workingForm: json["working_form"],
      workFields: _parseListString(json["work_fields"]),
      workExperience: json["work_experience"],
      education: json["education"],
      position: json["position"],
      requirement: json["requirement"],
      endDate: json["end_date"],
      isFullTime: json["is_fulltime"],
      slug: json["slug"] ?? "",
      skills: json["skills"],
      gender: json["gender"],
      isActive: json["is_active"],
      isUrgent: json["is_urgent"],
      benefit: json["benefit"],
      salaryNegotiable: json["salary_negotiable"],
      address: json["address"],
      district: json["district"],
      similar: (src['similar_job'] as List? ?? [])
          .map((e) => SimilarJob.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }

  static int? _parseInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    return int.tryParse("$v");
  }

  static List<String> _parseListString(dynamic v) {
    if (v == null) return [];
    if (v is List) {
      return v.map((e) => "$e").toList();
    }
    if (v is String) {
      return v.split(",").map((e) => e.trim()).toList();
    }
    return [];
  }
}

class SimilarJob {
  final int id;
  final String slug;
  final String title;
  final String companyName;
  final String? companyLogo;
  final String salaryRange;
  final String location;
  final int? deadline;
  final String? isUrgent;

  SimilarJob({
    required this.id,
    required this.slug,
    required this.title,
    required this.companyName,
    required this.salaryRange,
    required this.location,
    this.companyLogo,
    this.deadline,
    this.isUrgent,
  });

  factory SimilarJob.fromJson(Map<String, dynamic> json) {
    return SimilarJob(
      id: json['id'] ?? 0,
      slug: json['slug'] ?? '',
      title: json['title'] ?? '',
      companyName: json['company_name'] ?? '',
      companyLogo: json['company_logo'],
      salaryRange: json['salary_range'] ?? '',
      location: json['location'] ?? '',
      deadline: (json['deadline'] as num?)?.toInt(),
      isUrgent: json["is_urgent"],
    );
  }
}
