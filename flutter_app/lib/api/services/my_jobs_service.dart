import 'package:mobile/api/models/applied_job.dart';
import 'package:mobile/api/services/api_service.dart';

class MyJobsService {
  static Future<({List<AppliedJob> items, int currentPage, int lastPage})>
  fetchApplied({int page = 1}) async {
    final raw = await ApiService.get<dynamic>(
      '/job/user/applied',
      query: {'page': page},
      parser: (json) => json,
    );
    print(raw);
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

    int _asInt(v) {
      if (v is int) return v;
      if (v is num) return v.toInt();
      return int.tryParse('$v') ?? 1;
    }

    return (
      items: items,
      currentPage: _asInt(meta['current_page']),
      lastPage: _asInt(meta['last_page']),
    );
  }
}
