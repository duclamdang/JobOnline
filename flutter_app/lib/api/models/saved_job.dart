class SavedJob {
  final int id;
  final String slug;
  final String title;
  final String companyName;
  final String companyLogo;
  final String salaryRange;
  final String location;
  final int deadline;

  const SavedJob({
    required this.id,
    required this.slug,
    required this.title,
    required this.companyName,
    required this.companyLogo,
    required this.salaryRange,
    required this.location,
    required this.deadline,
  });

  factory SavedJob.fromJson(Map<String, dynamic> json) {
    return SavedJob(
      id: json['id'] as int,
      slug: json['slug'] as String,
      title: json['title'] as String,
      companyName: json['company_name'] as String,
      companyLogo: json['company_logo'] as String,
      salaryRange: json['salary_range'] as String,
      location: json['location'] as String,
      deadline: (json['deadline'] ?? 0) as int,
    );
  }
}
