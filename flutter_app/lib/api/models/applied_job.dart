class AppliedJob {
  final int id;
  final String jobTitle;
  final int jobId;
  final String companyName;
  final String? companyLogo;
  final String? salaryRange;
  final String? location;
  final String? cvUrl;
  final DateTime? appliedAt;
  final DateTime? endDate;
  final String? status;

  AppliedJob({
    required this.id,
    required this.jobTitle,
    required this.jobId,
    required this.companyName,
    this.companyLogo,
    this.salaryRange,
    this.location,
    this.cvUrl,
    this.appliedAt,
    this.endDate,
    this.status,
  });

  factory AppliedJob.fromJson(Map<String, dynamic> json) {
    int _asInt(v) => v is int ? v : int.tryParse('$v') ?? 0;
    DateTime? _asDate(v) => v == null ? null : DateTime.tryParse('$v');

    return AppliedJob(
      id: _asInt(json['id']),
      jobTitle: (json['job_title'] ?? '').toString(),
      jobId: (json['job_id']),
      companyName: (json['company_name'] ?? '').toString(),
      companyLogo: json['company_logo']?.toString(),
      salaryRange: json['salary_range']?.toString(),
      location: json['location']?.toString(),
      cvUrl: json['cv']?.toString(),
      appliedAt: _asDate(json['applied_at']),
      endDate: _asDate(json['end_date']),
      status: json['status']?.toString(),
    );
  }
}
