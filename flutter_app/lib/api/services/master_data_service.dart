import 'package:mobile/api/models/education.dart';
import 'package:mobile/api/models/position.dart';
import 'package:mobile/api/models/province.dart';
import 'package:mobile/api/models/work_experience.dart';
import 'package:mobile/api/models/work_field.dart';
import 'package:mobile/api/models/working_form.dart';
import 'package:mobile/api/services/api_service.dart';

class MasterDataService {
  static Future<List<Province>> fetchProvinces() {
    return ApiService.get<List<Province>>(
      '/locations/provinces',
      parser: (json) {
        if (json is List) {
          return json
              .map(
                (e) => Province.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
        }
        final map = Map<String, dynamic>.from(json as Map);
        final List raw = (map['data'] as List?) ?? const [];
        return raw
            .map((e) => Province.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  static Future<List<WorkField>> fetchWorkFields() {
    return ApiService.get<List<WorkField>>(
      'catalogs/work-fields',
      parser: (json) {
        final list = json is List
            ? json
            : (Map<String, dynamic>.from(json as Map)['data'] as List? ??
                  const []);
        return list
            .map((e) => WorkField.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  static Future<List<WorkExperience>> fetchWorkExperiences() {
    return ApiService.get<List<WorkExperience>>(
      '/catalogs/work-experiences',
      parser: (json) {
        final list = json is List
            ? json
            : (Map<String, dynamic>.from(json as Map)['data'] as List? ??
                  const []);
        return list
            .map(
              (e) =>
                  WorkExperience.fromJson(Map<String, dynamic>.from(e as Map)),
            )
            .toList();
      },
    );
  }

  static Future<List<Position>> fetchPositions() {
    return ApiService.get<List<Position>>(
      '/catalogs/positions',
      parser: (json) {
        final list = json is List
            ? json
            : (Map<String, dynamic>.from(json as Map)['data'] as List? ??
                  const []);
        return list
            .map((e) => Position.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  static Future<List<Education>> fetchEducations() {
    return ApiService.get<List<Education>>(
      '/catalogs/educations',
      parser: (json) {
        final list = json is List
            ? json
            : (Map<String, dynamic>.from(json as Map)['data'] as List? ??
                  const []);
        return list
            .map((e) => Education.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  static Future<List<WorkingForm>> fetchWorkingForms() {
    return ApiService.get<List<WorkingForm>>(
      '/catalogs/working-forms',
      parser: (json) {
        final list = json is List
            ? json
            : (Map<String, dynamic>.from(json as Map)['data'] as List? ??
                  const []);
        return list
            .map(
              (e) => WorkingForm.fromJson(Map<String, dynamic>.from(e as Map)),
            )
            .toList();
      },
    );
  }
}
