class CompanyModel {
  final int id;
  final String name;
  final String? logo;
  final String? coverImage;
  final String? website;
  final String? companySize;
  final String? description;
  final String? address;
  final String? email;
  final String? phone;
  final bool isActive;
  final int activeJobsCount;
  final String? locationName;
  final String? industryTitle;

  CompanyModel({
    required this.id,
    required this.name,
    this.logo,
    this.coverImage,
    this.website,
    this.companySize,
    this.description,
    this.address,
    this.email,
    this.phone,
    required this.isActive,
    required this.activeJobsCount,
    this.locationName,
    this.industryTitle,
  });

  factory CompanyModel.fromJson(Map<String, dynamic> json) {
    final src = json.containsKey('data')
        ? Map<String, dynamic>.from(json['data'] as Map)
        : Map<String, dynamic>.from(json);
    final loc = (src['location'] is Map)
        ? Map<String, dynamic>.from(src['location'])
        : null;
    final ind = (src['industry'] is Map)
        ? Map<String, dynamic>.from(src['industry'])
        : null;
    return CompanyModel(
      id: src['id'] is int ? src['id'] : int.tryParse('${src['id']}') ?? 0,
      name: src['name']?.toString() ?? '',
      logo: src['logo']?.toString(),
      coverImage: src['cover_image']?.toString(),
      website: src['website']?.toString(),
      companySize: src['company_size']?.toString(),
      description: src['description']?.toString(),
      address: src['address']?.toString(),
      email: src['email']?.toString(),
      phone: src['phone']?.toString(),
      isActive: (src['is_active'] is bool)
          ? src['is_active'] as bool
          : (src['is_active'].toString() == '1'),
      activeJobsCount: (src['active_jobs_count'] as num?)?.toInt() ?? 0,
      locationName: loc?['name']?.toString(),
      industryTitle: ind?['title']?.toString(),
    );
  }
}
