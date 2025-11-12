import 'package:mobile/api/models/job_model.dart';

class SavedJob {
  final int id; // id bản ghi lưu
  final int jobId; // id job
  final DateTime? savedAt; // thời gian lưu (created_at / saved_at)
  final JobModel job; // thông tin job tối thiểu

  SavedJob({
    required this.id,
    required this.jobId,
    required this.job,
    this.savedAt,
  });

  factory SavedJob.fromJson(Map<String, dynamic> json) {
    final src = Map<String, dynamic>.from(json);

    Map<String, dynamic> _pickJob(Map<String, dynamic> m) {
      if (m['job'] is Map) return Map<String, dynamic>.from(m['job']);
      // Một số API trả phẳng job ngay trên level hiện tại:
      // gom các field có trong JobModel để tạo job object tối thiểu
      return {
        'id': m['job_id'] ?? m['id'],
        'title': m['title'],
        'company_name': m['company_name'],
        'company_logo': m['company_logo'],
        'salary_range': m['salary_range'],
        'location': m['location'],
        'slug': m['slug'],
        'deadline': m['deadline'],
        'is_urgent': m['is_urgent'],
        'is_active': m['is_active'],
      }..removeWhere((k, v) => v == null);
    }

    int _asInt(v) {
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse('$v') ?? 0;
    }

    DateTime? _asDate(v) => v == null ? null : DateTime.tryParse('$v');

    final jobJson = _pickJob(src);

    return SavedJob(
      id: _asInt(src['id']),
      jobId: _asInt(src['job_id'] ?? jobJson['id']),
      savedAt: _asDate(src['created_at'] ?? src['saved_at']),
      job: JobModel.fromJson(jobJson),
    );
  }
}
