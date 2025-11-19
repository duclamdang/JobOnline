import 'dart:io';
import 'package:mobile/api/models/cv_model.dart';
import 'package:mobile/api/models/profile_model.dart';
import 'package:mobile/api/services/api_service.dart';

class ProfileService {
  static Future<ProfileModel> fetchBasic() {
    return ApiService.get<ProfileModel>(
      'user/profile/basic-info',
      parser: (json) =>
          ProfileModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<ProfileModel> fetchDetail() async {
    final res = await ApiService.get<Map<String, dynamic>>(
      'user/profile',
      parser: (json) => Map<String, dynamic>.from(json as Map),
    );
    return ProfileModel.fromDetailJson(res);
  }

  static Future<ProfileModel> updateBasic(ProfileModel basic) {
    return ApiService.put<ProfileModel>(
      'user/profile/basic-info',
      body: basic.toUpdatePayload(),
      parser: (json) =>
          ProfileModel.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<List<CvModel>> fetchCVs() async {
    return ApiService.get<List<CvModel>>(
      '/user/profile/cvs',
      parser: (json) {
        final List list = json as List;
        return list
            .map((e) => CvModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      },
    );
  }

  static Future<void> setMainCv(int id) async {
    await ApiService.post<dynamic>(
      '/user/profile/cvs/$id/set-main',
      parser: (_) => null,
    );
  }

  static Future<void> deleteCv(int id) async {
    await ApiService.delete<dynamic>(
      '/user/profile/cvs/$id',
      parser: (_) => null,
    );
  }

  static Future<CvModel> uploadCv(File file) {
    return ApiService.upload<CvModel>(
      '/user/profile/cvs',
      fields: const {},
      file: file,
      fileField: 'cv_file',
      parser: (json) {
        if (json is Map && json['data'] is Map) {
          return CvModel.fromJson(Map<String, dynamic>.from(json['data']));
        }
        if (json is Map) {
          return CvModel.fromJson(Map<String, dynamic>.from(json));
        }
        throw 'Phản hồi không hợp lệ';
      },
    );
  }

  static Future<ProfileModel> uploadAvatar(File file) {
    return ApiService.upload<ProfileModel>(
      'user/profile/avatar',
      file: file,
      fileField: 'avatar',
      fields: const {},
      parser: (json) {
        if (json is Map && json['data'] != null) {
          return ProfileModel.fromJson(Map<String, dynamic>.from(json['data']));
        }
        return ProfileModel.fromJson(Map<String, dynamic>.from(json as Map));
      },
    );
  }

  static Future<ProfileModel> fetchJobCriteria() {
    return ApiService.get<ProfileModel>(
      'user/profile/job-criteria',
      parser: (json) =>
          ProfileModel.fromDetailJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<void> updateJobCriteria({
    String? desiredPosition,
    int? workFieldId,
    int? provinceId,
    int? minSalary,
    int? maxSalary,
    int? workingFormId,
  }) {
    final body = <String, dynamic>{};

    if (desiredPosition != null && desiredPosition.isNotEmpty) {
      body['desired_position'] = desiredPosition;
    }
    if (workFieldId != null) body['work_field_id'] = workFieldId;
    if (provinceId != null) body['province_id'] = provinceId;
    if (minSalary != null) body['min_salary'] = minSalary;
    if (maxSalary != null) body['max_salary'] = maxSalary;
    if (workingFormId != null) body['working_form_id'] = workingFormId;

    return ApiService.put<dynamic>(
      'user/profile/job-criteria',
      body: body,
      parser: (_) => null,
    );
  }

  static Future<ProfileModel> fetchGeneralInfo() {
    return ApiService.get<ProfileModel>(
      'user/profile/general-info',
      parser: (json) =>
          ProfileModel.fromDetailJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  static Future<void> updateGeneralInfo({
    int? workExperienceId,
    int? positionId,
    int? educationId,
  }) {
    final body = <String, dynamic>{};

    if (workExperienceId != null) body['work_experience_id'] = workExperienceId;
    if (positionId != null) body['position_id'] = positionId;
    if (educationId != null) body['education_id'] = educationId;

    return ApiService.put<dynamic>(
      'user/profile/general-info',
      body: body,
      parser: (_) => null,
    );
  }
}
