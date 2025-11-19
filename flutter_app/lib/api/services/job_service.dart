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

  static Future<PageResult<JobModel>> searchJobs({
    String? keyword,
    List<int>? fields,
    List<int>? location,
    List<int>? salary,
    List<int>? experience,
    List<int>? position,
    List<int>? education,
    List<int>? workingForm,
    List<int>? gender,
    int page = 1,
  }) {
    final query = <String, dynamic>{
      'page': page,
      if (keyword != null && keyword.isNotEmpty) 'keyword': keyword,
      if (fields != null && fields.isNotEmpty) 'fields': fields.join(','),
      if (location != null && location.isNotEmpty)
        'location': location.join(','),
      if (salary != null && salary.isNotEmpty) 'salary': salary.join(','),
      if (experience != null && experience.isNotEmpty)
        'experience': experience.join(','),
      if (position != null && position.isNotEmpty)
        'position': position.join(','),
      if (education != null && education.isNotEmpty)
        'education': education.join(','),
      if (workingForm != null && workingForm.isNotEmpty)
        'working_form': workingForm.join(','),
      if (gender != null && gender.isNotEmpty) 'gender': gender.join(','),
    };

    return ApiService.get<PageResult<JobModel>>(
      '/job/search',
      query: query,
      parser: (json) {
        if (json is Map) {
          return PageResult.fromLaravelJson(
            Map<String, dynamic>.from(json),
            (m) => JobModel.fromJson(Map<String, dynamic>.from(m as Map)),
          );
        }
        if (json is List) {
          final items = json
              .map(
                (e) => JobModel.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
          return PageResult<JobModel>(
            items: items,
            total: items.length,
            perPage: items.length,
            currentPage: 1,
            lastPage: 1,
          );
        }
        return PageResult<JobModel>(
          items: const [],
          total: 0,
          perPage: 0,
          currentPage: 1,
          lastPage: 1,
        );
      },
    );
  }
}
