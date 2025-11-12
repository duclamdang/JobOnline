import 'package:mobile/api/models/page_result.dart';
import 'package:mobile/api/services/api_service.dart';
import 'package:mobile/api/models/job_model.dart';

class JobService {
  static Future<PageResult<JobModel>> fetchJobs({int page = 1}) {
    return ApiService.get<PageResult<JobModel>>(
      '/job',
      query: {'page': page},
      parser: (json) => PageResult.fromLaravelJson(
        Map<String, dynamic>.from(json as Map),
        (m) => JobModel.fromJson(Map<String, dynamic>.from(m)),
      ),
    );
  }

  static Future<JobModel> fetchJobDetail(int id) {
    return ApiService.get<JobModel>(
      '/job/$id',
      parser: (json) =>
          JobModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<JobModel> fetchJobDetailBySlug(String slug) {
    return ApiService.get<JobModel>(
      '/job/detail/$slug',
      parser: (json) =>
          JobModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }
}
