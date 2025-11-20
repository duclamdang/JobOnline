import 'package:mobile/api/models/applied_job.dart';
import 'package:mobile/api/models/saved_job.dart';
import 'package:mobile/api/services/api_service.dart';

class SaveResult {
  final bool alreadySaved;
  final String? message;
  const SaveResult({required this.alreadySaved, this.message});
}

class MyJobsService {
  static Future<({List<AppliedJob> items, int currentPage, int lastPage})>
  fetchApplied({int page = 1}) async {
    final raw = await ApiService.get<dynamic>(
      '/job/user/applied',
      query: {'page': page},
      parser: (json) => json,
    );
    if (raw is List) {
      final items = raw
          .map((e) => AppliedJob.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      return (items: items, currentPage: 1, lastPage: 1);
    }

    final map = Map<String, dynamic>.from(raw as Map);
    final List data = (map['data'] as List?) ?? const [];
    final meta = Map<String, dynamic>.from(map['meta'] ?? const {});
    final items = data
        .map((e) => AppliedJob.fromJson(Map<String, dynamic>.from(e)))
        .toList();

    int asInt(v) {
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse('$v') ?? 1;
    }

    return (
      items: items,
      currentPage: asInt(meta['current_page']),
      lastPage: asInt(meta['last_page']),
    );
  }

  static Future<void> applyJob({required int jobId, required int cvId}) async {
    final raw = await ApiService.post<dynamic>(
      '/job/user/apply',
      body: {'job_id': jobId, 'cv_id': cvId},
    );
    int code = 200;
    String? msg;

    if (raw is Map) {
      if (raw['status_code'] is num) {
        code = (raw['status_code'] as num).toInt();
      }
      if (raw['message'] is String) {
        msg = raw['message'] as String;
      }
    }

    if (code != 200 && code != 201) {
      throw Exception(msg ?? 'Ứng tuyển thất bại (status_code=$code)');
    }
  }

  //Saved job
  static Future<({List<SavedJob> items, int currentPage, int lastPage})>
  fetchSaved({int page = 1}) async {
    final raw = await ApiService.get<dynamic>(
      '/job/user/saved',
      query: {'page': page},
      parser: (json) => json,
    );
    if (raw is List) {
      final items = raw
          .map((e) => SavedJob.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      return (items: items, currentPage: 1, lastPage: 1);
    }

    final map = Map<String, dynamic>.from(raw as Map);
    final List data = (map['data'] as List?) ?? const [];
    final meta = Map<String, dynamic>.from(map['meta'] ?? const {});
    final items = data
        .map((e) => SavedJob.fromJson(Map<String, dynamic>.from(e)))
        .toList();

    int asInt(v) {
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse('$v') ?? 1;
    }

    return (
      items: items,
      currentPage: asInt(meta['current_page']),
      lastPage: asInt(meta['last_page']),
    );
  }

  static Future<SaveResult> saveJob({required int jobId}) async {
    final raw = await ApiService.post<dynamic>(
      '/job/user/saved',
      body: {'job_id': jobId},
    );

    final code = (raw is Map && raw['status_code'] is num)
        ? (raw['status_code'] as num).toInt()
        : 200;
    final msg = (raw is Map && raw['message'] is String)
        ? raw['message'] as String
        : null;

    if (code == 200 || code == 201) {
      return const SaveResult(alreadySaved: false);
    }
    if (code == 409) {
      return SaveResult(
        alreadySaved: true,
        message: msg ?? 'Bạn đã lưu công việc này rồi.',
      );
    }

    throw Exception('Save job failed (status_code=$code)');
  }

  static Future<void> unsaveJob({required int jobId}) async {
    final raw = await ApiService.delete<dynamic>('/job/user/saved/$jobId');
    final code = (raw is Map && raw['status_code'] is num)
        ? (raw['status_code'] as num).toInt()
        : 200;
    if (code != 200 && code != 204) {
      throw Exception('Unsave job failed (status_code=$code)');
    }
  }
}
